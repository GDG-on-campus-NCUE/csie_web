<?php

namespace App\Services;

use App\Models\Classroom;
use App\Models\Lab;
use App\Models\ManageActivity;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TagService
{
	public function __construct(private ConnectionInterface $connection)
	{
	}

	/**
	 * 合併標籤並回傳影響的資料數量。
	 *
	 * @param  array<int>  $sourceIds
	 * @return array{affected_resources: int, deactivated_tags: int}
	 */
	public function mergeTags(int $targetId, array $sourceIds, ?User $actor = null): array
	{
		return $this->connection->transaction(function () use ($targetId, $sourceIds, $actor) {
			$target = Tag::query()->lockForUpdate()->findOrFail($targetId);
			$sources = Tag::query()
				->whereIn('id', $sourceIds)
				->lockForUpdate()
				->get()
				->reject(fn (Tag $tag) => $tag->id === $target->id)
				->values();

			if ($sources->isEmpty()) {
				return [
					'affected_resources' => 0,
					'deactivated_tags' => 0,
				];
			}

			$context = $target->context;

			$contexts = $sources->pluck('context')->unique();
			if ($contexts->count() > 1 || $contexts->first() !== $context) {
				throw new \InvalidArgumentException('Merge requires tags in the same context.');
			}

			$affected = match ($context) {
				'posts' => $this->reassignPostTags($target, $sources),
				'labs', 'classrooms', 'spaces' => $this->reassignSpaceTags($target, $sources, $context),
				default => $this->reassignGenericTags($target, $sources),
			};

			$now = now();
			$target->forceFill([
				'is_active' => true,
				'last_used_at' => $now,
			])->save();

			$deactivated = 0;
			foreach ($sources as $source) {
				if (! $source->is_active) {
					continue;
				}

				$source->forceFill([
					'is_active' => false,
					'last_used_at' => $source->last_used_at ?? $now,
				])->save();
				$deactivated++;
			}

			ManageActivity::log(
				$actor,
				'tag.merged',
				$target,
				[
					'target_id' => $target->id,
					'source_ids' => $sources->pluck('id')->all(),
					'context' => $context,
					'affected_resources' => $affected,
					'deactivated' => $deactivated,
				],
			);

			return [
				'affected_resources' => $affected,
				'deactivated_tags' => $deactivated,
			];
		});
	}

	/**
	 * 將標籤拆分為多個新標籤。
	 *
	 * @param  array<int, string>  $names
	 * @return array{created: array<int, Tag>, deactivated_original: bool}
	 */
	public function splitTag(Tag $tag, array $names, bool $keepOriginal = true, ?string $color = null, ?User $actor = null): array
	{
		if (empty($names)) {
			return [
				'created' => [],
				'deactivated_original' => false,
			];
		}

		return $this->connection->transaction(function () use ($tag, $names, $keepOriginal, $color, $actor) {
			$context = $tag->context;
			$normalized = Collection::make($names)
				->map(static fn ($value) => trim((string) $value))
				->filter()
				->unique()
				->values();

			$created = [];

			foreach ($normalized as $name) {
				$existing = Tag::query()
					->where('context', $context)
					->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
					->first();

				if ($existing) {
					continue;
				}

				$newTag = new Tag([
					'context' => $context,
					'name' => $name,
					'name_en' => null,
					'description' => null,
					'color' => $color ?? $tag->color,
					'is_active' => true,
					'sort_order' => 0,
					'last_used_at' => null,
				]);
				$newTag->slug = Tag::generateUniqueSlug($name, $context);
				$newTag->save();
				$created[] = $newTag;
			}

			$deactivated = false;

			if (! $keepOriginal && $tag->is_active) {
				$tag->forceFill([
					'is_active' => false,
				])->save();
				$deactivated = true;
			}

			ManageActivity::log(
				$actor,
				'tag.split',
				$tag,
				[
					'context' => $context,
					'keep_original' => $keepOriginal,
					'created_tag_ids' => array_map(static fn (Tag $item) => $item->id, $created),
				]
			);

			return [
				'created' => $created,
				'deactivated_original' => $deactivated,
			];
		});
	}

	/**
	 * 重新指派公告使用的標籤。
	 *
	 * @param  Collection<int, Tag>  $sources
	 */
	protected function reassignPostTags(Tag $target, Collection $sources): int
	{
		$sourceIds = $sources->pluck('id')->all();
		$rows = DB::table('post_tag')
			->whereIn('tag_id', $sourceIds)
			->get();

		if ($rows->isEmpty()) {
			return 0;
		}

		$affectedPosts = $rows->pluck('post_id')->unique();

		foreach ($rows as $row) {
			$exists = DB::table('post_tag')
				->where('post_id', $row->post_id)
				->where('tag_id', $target->id)
				->exists();

			if (! $exists) {
				DB::table('post_tag')->insert([
					'post_id' => $row->post_id,
					'tag_id' => $target->id,
				]);
			}
		}

		DB::table('post_tag')->whereIn('tag_id', $sourceIds)->delete();

		return $affectedPosts->count();
	}

	/**
	 * @param  Collection<int, Tag>  $sources
	 */
	protected function reassignSpaceTags(Tag $target, Collection $sources, string $context): int
	{
		$sourceIds = $sources->pluck('id')->all();

		$query = DB::table('space_tag as st')
			->join('spaces as s', 's.id', '=', 'st.space_id')
			->whereIn('st.tag_id', $sourceIds);

		$query = match ($context) {
			'labs' => $query->where('s.space_type', \App\Models\Lab::TYPE_LAB),
			'classrooms' => $query->where('s.space_type', \App\Models\Classroom::TYPE_CLASSROOM),
			default => $query,
		};

		$rows = $query->select(['st.space_id', 'st.tag_id'])->get();

		if ($rows->isEmpty()) {
			return 0;
		}

		$affectedSpaces = $rows->pluck('space_id')->unique();

		foreach ($rows as $row) {
			$exists = DB::table('space_tag')
				->where('space_id', $row->space_id)
				->where('tag_id', $target->id)
				->exists();

			if (! $exists) {
				DB::table('space_tag')->insert([
					'space_id' => $row->space_id,
					'tag_id' => $target->id,
				]);
			}
		}

		DB::table('space_tag')->whereIn('tag_id', $sourceIds)->delete();

		return $affectedSpaces->count();
	}

	/**
	 * 預留給未實作的模組，僅停用來源標籤。
	 *
	 * @param  Collection<int, Tag>  $sources
	 */
	protected function reassignGenericTags(Tag $target, Collection $sources): int
	{
		// 目前沒有其他關聯，僅視為停用來源。
		return 0;
	}
}
