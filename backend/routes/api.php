<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Middleware\LogApiRequests;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Broadcast;

Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
})->middleware(LogApiRequests::class);

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/products', [ProductController::class, 'userProducts']);
    Route::get('/total-products', [ProductController::class, 'totalProducts']);
    Route::get('/total-sales', [ProductController::class, 'totalSales']);
    Route::get('/customers', [AuthController::class, 'customers']);
    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/messages/{conversationId}', [ChatController::class, 'getMessages']);
    Route::get('/chat/conversations', [ChatController::class, 'getConversations']);
    Route::get('/chat/users', [ChatController::class, 'getUsers']);
    Route::post('/chat/read/{conversationId}', [ChatController::class, 'markAsRead']);
    

    Route::middleware('role:user')->group(function () {
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{item}', [CartController::class, 'update']);
        Route::delete('/cart/{item}', [CartController::class, 'destroy']);
        Route::post('/checkout', [CartController::class, 'checkout']);
        Route::get('/wallet', [AuthController::class, 'wallet']);
        Route::get('/orders', [CartController::class, 'orders']);
        Route::get('/history', [CartController::class, 'history']);
        Route::get('/orders/{order}/invoice', [CartController::class, 'downloadInvoice']);
        // Frontend-friendly aliases
        });
        
        Route::middleware('role:admin')->group(function () {
        Route::post('/products/upload', [ProductController::class, 'uploadBulk']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    });

});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::delete('/product/{id}', [ProductController::class, 'delete']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/product/{id}', [ProductController::class, 'update']);
    Route::post('/products/bulk-upload', [ProductController::class, 'bulkUpload']);
    Route::get('/import-status/{id}', function ($id) {
        return response()->json(
            \App\Models\Import::findOrFail($id)
        );
    });
});

Route::get('/products', [ProductController::class, 'index']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);