<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProductsImport implements ToModel, WithHeadingRow, SkipsEmptyRows, WithChunkReading, WithBatchInserts, ShouldQueue
{
    protected $userId;

    public function __construct($userId = null)
    {
        $this->userId = $userId;
    }

    /**
     * Size of each chunk read from the file (reduces memory).
     */
    public function chunkSize(): int
    {
        // smaller chunk size reduces memory and per-chunk processing time
        return 200;
    }

    /**
     * Batch size for database inserts.
     */
    public function batchSize(): int
    {
        return 100;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Use heading keys and skip rows with no name (prevents header/blank row import)
        $name = isset($row['name']) ? trim((string) $row['name']) : '';
        if ($name === '') {
            return null;
        }

        $price = $this->parseDecimal($row['price'] ?? null);
        $stock = isset($row['stock']) ? (int) preg_replace('/\D/', '', (string) $row['stock']) : 0;
        $rating = isset($row['rating']) ? $this->parseDecimal($row['rating']) : 0;

        $features = $row['features'] ?? '';
        if (is_string($features) && $features !== '') {
            $decoded = json_decode($features, true);
            if ($decoded === null) {
                $features = array_map('trim', explode(',', $features));
            } else {
                $features = $decoded;
            }
        } else {
            $features = [];
        }

        return new Product([
            'name' => $name,
            'description' => $row['description'] ?? null,
            'price' => $price,
            'stock' => $stock,
            'features' => $features,
            'category' => $row['category'] ?? null,
            'rating' => $rating,
            'image' => $row['image'] ?? null,
            'user_id' => $this->userId,
        ]);
    }

    protected function parseDecimal($value)
    {
        if ($value === null) {
            return 0;
        }
        if (is_numeric($value)) {
            return (float) $value;
        }
        $clean = preg_replace('/[^\d\.\-]/', '', (string)$value);
        return $clean === '' ? 0 : (float) $clean;
    }

    // alias for legacy calls
    protected function parsePrice($value)
    {
        return $this->parseDecimal($value);
    }
}
