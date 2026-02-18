<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class creditCoin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     * 
     */

    protected $signature = 'app:credit-coin {amount : The amount of coins to credit}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Give all users a specified amount of credit coins';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $amount = (int) $this->argument('amount');

        if ($amount <= 0) {
            $this->error('Amount must be a positive integer.');
            return;
        }

        $users = User::all();

        foreach ($users as $user) {
            $user->coin += $amount;
            $user->update(['coin' => $user->coin]);
        }

        $this->info("Successfully credited {$amount} coins to all users.");
    }
}
