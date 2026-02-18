<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(RegisterRequest $req)
    {
        if ($req->validated()) {
            $user = User::create([
                'name' => $req->name,
                'email' => $req->email,
                'password' => Hash::make($req->password),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'message' => 'User Registered Successfully',
                'user' => $user,
                'access_token' => $token,
                'success' => true,
                'token_type' => 'Bearer'
            ], 201);
        } else {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $req->errors(),
                'success' => false
            ], 422);
        }
    }

    public function login(LoginRequest $req)
    {
        if ($req->validated()) {
            if (!Auth::attempt($req->only('email', 'password'), $req->filled('remember-me'))) {
                return response()->json([
                    'message' => 'Invalid Credentials',
                    'success' => false
                ], 401);
            } else {
                // dd(Auth::user());
                $user = User::where('email', $req->email)->firstOrFail();
                $token = $user->createToken('auth_token')->plainTextToken; 

                return response()->json([
                    'message' => 'Login Successful',
                    'user' => new UserResource($user),
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'success' => true
                ]);
            }
        } else {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $req->errors(),
                'success' => false
            ], 422);
        }
    }

    public function logout(Request $request)
    {
        
    $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
            'success' => true
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()),
            'success' => true
        ]);
    }

    public function wallet(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'wallet_balance' => $user->coin ?? 0,
            'success' => true
        ]);
    }

    public function customers(Request $request)
    {
        $userid = $request->user()->id;
        $customers = User::whereHas('orders', function($query) use ($userid) {
            $query->whereHas('items', function($subquery) use ($userid) {
                $subquery->whereHas('product', function($productQuery) use ($userid) {
                    $productQuery->where('user_id', $userid);
                });
            });
        })->distinct()->get()->count();
        return response()->json([
            'customers' => $customers,
            'success' => true
        ]);
    }

}
