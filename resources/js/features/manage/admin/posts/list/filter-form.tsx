import FilterPanel from '@/components/manage/filter-panel';
import { manageFilterControlClass } from '@/components/manage/filter-styles';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import type { ManagePostFilterOptions } from '@/types/manage';

export interface ManagePostsFilterFormProps {
    keyword: string;
    tag: string;
    perPage: string;
    tagOptions: NonNullable<ManagePostFilterOptions['tags']>;
    perPageOptions: readonly string[];
    onKeywordChange: (value: string) => void;
    onTagChange: (value: string) => void;
    onPerPageChange: (value: string) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function ManagePostsFilterForm({
    keyword,
    tag,
    perPage,
    tagOptions,
    perPageOptions,
    onKeywordChange,
    onTagChange,
    onPerPageChange,
    onApply,
    onReset,
}: ManagePostsFilterFormProps) {
    const { t: tPosts } = useTranslator('manage.posts');

    return (
        <FilterPanel
            title={tPosts('filters.title', '篩選條件')}
            collapsible={true}
            defaultOpen={true}
            onApply={onApply}
            onReset={onReset}
            applyLabel={tPosts('filters.apply', '套用篩選')}
            resetLabel={tPosts('filters.reset', '重設')}
        >
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 space-y-2 md:col-span-4">
                    <label className="text-sm font-medium text-neutral-700">
                        {tPosts('filters.keyword_label', '搜尋公告')}
                    </label>
                    <Input
                        type="search"
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder={tPosts('filters.keyword_placeholder', '搜尋標題或關鍵字')}
                        className={manageFilterControlClass()}
                        aria-label={tPosts('filters.keyword_label', '搜尋公告')}
                    />
                </div>

                <div className="col-span-12 space-y-2 md:col-span-4">
                    <label className="text-sm font-medium text-neutral-700">
                        {tPosts('filters.tag_label', '標籤篩選')}
                    </label>
                    <Select
                        value={tag}
                        onChange={(event) => onTagChange(event.target.value)}
                        className={manageFilterControlClass()}
                        aria-label={tPosts('filters.tag_label', '標籤篩選')}
                    >
                        <option value="">{tPosts('filters.tag_all', '全部標籤')}</option>
                        {tagOptions.map((tagOption) => {
                            const optionValue = tagOption.value ?? tagOption.id ?? tagOption.label;
                            return (
                                <option key={String(optionValue)} value={String(optionValue)}>
                                    {tagOption.label}
                                </option>
                            );
                        })}
                    </Select>
                </div>

                <div className="col-span-12 space-y-2 md:col-span-4">
                    <label className="text-sm font-medium text-neutral-700">
                        {tPosts('filters.per_page_label', '每頁筆數')}
                    </label>
                    <Select
                        value={perPage}
                        onChange={(event) => onPerPageChange(event.target.value)}
                        className={manageFilterControlClass()}
                        aria-label={tPosts('filters.per_page_label', '每頁筆數')}
                    >
                        {perPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {tPosts('filters.per_page_option', ':count 筆/頁', { count: Number(option) })}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
        </FilterPanel>
    );
}
