<?php

namespace App\Console\Commands;
use App\Models\Product;

use Illuminate\Console\Command;

class setPrice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:set-price';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set all product prices to 100';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $products = Product::all();

        foreach ($products as $product) {
            $product->price = 100;
            $product->save();
        }

        $this->info('Prices updated successfully!');
    }
}
