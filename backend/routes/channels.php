<?php
namespace App\Models;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;


Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    Log::info('User inside channel chat.'.$conversationId.': ' . ($user ? $user->id : 'NO USER'));
    return true;
});

Broadcast::channel('admin.chat', function ($user) {
    return $user->is_admin;
});


// Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {

//     $conversation = Conversation::find($conversationId);

//     if (!$conversation) return false;

//     return $user->id === $conversation->user_id
//         || $user->role === 'admin';
// });