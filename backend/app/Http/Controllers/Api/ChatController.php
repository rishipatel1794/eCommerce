<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Events\MessageSent;

class ChatController extends Controller
{
    public function getConversations(Request $request)
    {
        $user = $request->user();
        $query = Conversation::with(['user', 'messages' => function($query) {
            $query->latest()->limit(1);
        }])->withCount(['messages as unread_count' => function($query) use ($user) {
            $query->where('sender_id', '!=', $user->id)->where('is_read', false);
        }]);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return $query->get()->map(function($conversation) {
            return [
                'id' => $conversation->id,
                'user' => $conversation->user,
                'last_message' => $conversation->messages->first(),
                'unread_count' => $conversation->unread_count,
                'updated_at' => $conversation->updated_at
            ];
        });
    }

    public function getMessages($conversationId)
    {
        $conversation = Conversation::with(['messages.sender'])->findOrFail($conversationId);
        return response()->json($conversation->messages);
    }

    public function getUsers()
    {
        return \App\Models\User::where('is_admin', false)->get(['id', 'name', 'email']);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $user = $request->user();

        if($user->isAdmin()) {
            if (!$request->conversation_id && $request->user_id) {
                $conversation = Conversation::firstOrCreate(['user_id' => $request->user_id]);
            } else {
                $conversation = Conversation::findOrFail($request->conversation_id);
            }
        } else {
            $conversation = Conversation::firstOrCreate(['user_id' => $user->id]);
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'conversation_id' => $conversation->id,
            'message' => $request->message,
        ]);

        $conversation->touch(); // Update updated_at of conversation

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function markAsRead(Request $request, $conversationId)
    {
        $user = $request->user();
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}
