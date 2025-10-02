<?php

namespace App\Models\Builders;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Builder;

class AttachmentBuilder extends Builder
{
    public function where($column, $operator = null, $value = null, $boolean = 'and')
    {
        if (is_array($column)) {
            foreach ($column as &$clause) {
                if (! is_array($clause)) {
                    continue;
                }

                if (($clause[0] ?? null) === 'type' && isset($clause[2]) && is_string($clause[2])) {
                    $lookup = strtolower($clause[2]);
                    if (isset(Attachment::TYPE_MAP[$lookup])) {
                        $clause[2] = Attachment::TYPE_MAP[$lookup];
                    }
                }
            }

            unset($clause);

            return parent::where($column, $operator, $value, $boolean);
        }

        if ($column === 'type') {
            if ($value === null) {
                $value = $operator;
                $operator = '=';
            }

            if (is_string($value)) {
                $lookup = strtolower($value);
                if (isset(Attachment::TYPE_MAP[$lookup])) {
                    $value = Attachment::TYPE_MAP[$lookup];
                }
            }
        }

        return parent::where($column, $operator, $value, $boolean);
    }
}
