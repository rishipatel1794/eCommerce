<?php

namespace App\Jobs;

use App\Imports\ProductsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ImportProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    protected $filePath;

    public function __construct($userId, $filePath)
    {
        $this->userId = $userId;
        $this->filePath = $filePath;
    }

    public function handle()
    {
        Excel::import(new ProductsImport($this->userId), $this->filePath, 'local');
    }
}
