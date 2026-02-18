<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class CartController extends Controller
{
    public function index()
    {
        $cart = Cart::with('items.product')->where('user_id', Auth::id())->first();
        return response()->json($cart);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);
        $cartItem = $cart->items()->where('product_id', $request->product_id)->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $request->quantity);
        } else {
            $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json($cart->load('items.product'));
    }

    public function update(Request $request, CartItem $item)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);
        $item->update(['quantity' => $request->quantity]);
        return response()->json($item->load('product'));
    }

    public function destroy(CartItem $item)
    {
        $item->delete();
        return response()->json(['message' => 'Item removed from cart']);
    }

    public function checkout(Request $request)
    {
        $user = request()->user();

        // eager-load product and its owner to avoid lazy-loading issues
        $cart = Cart::with('items.product.user')->where('user_id', $user->id)->first();
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // calculate total
        $total = 0;
        foreach ($cart->items as $item) {
            $price = $item->product->price ?? 0;
            $total += $price * $item->quantity;
        }

        // simple shipping logic (same as frontend)
        $shipping = $total > 100 ? 0 : 10;
        $grandTotal = $total + $shipping;

        if (($user->coin ?? 0) < $grandTotal) {
            return response()->json(['message' => 'Insufficient coins'], 400);
        }

        DB::beginTransaction();
        try {
            // deduct coins
            $user->coin = $user->coin - $grandTotal;
            $user->update(['coins' => $user->coin]);
            // create order
            $order = Order::create([
                'user_id' => $user->id,
                'total' => $grandTotal,
                'status' => 'created',
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price ?? 0,
                ]);

                // reduce stock
                $product = $item->product;
                if ($product) {
                    $product->decrement('stock', $item->quantity);
                }

                $seller = $item->product->user ?? null;
                // treat is_admin as truthy/int; avoid strict === comparison to boolean
                if ($seller && !$seller->is_admin && $seller->id !== $user->id) {
                    $credit = ($item->product->price ?? 0) * $item->quantity;
                    // increment the real DB column 'coins'
                    $seller->increment('coins', $credit);
                    $seller->increment('coin', $credit);
                    $seller->refresh();
                }

            }
            OrderHistory::create([
                'order_id' => $order->id,
                'status' => 'created',
                'notes' => 'Order created via coin checkout',
            ]);

            // clear cart
            foreach ($cart->items as $item) {
                $item->delete();
            }

            DB::commit();
            $user->refresh();
            return response()->json(['message' => 'Order created', 'order' => $order, 'coins' => $user->coin], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Checkout failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function orders(Request $request)
    {
        $user = request()->user();
        $orders = $user->orders()->with('items.product')->get();
        $orders = $user->orders()->with('items.product', 'histories')->get();
        return response()->json([
            'orders' => $orders,
            'success' => true
        ], 200);
    }

    public function history(Request $request)
    {
        $user = request()->user();
        $histories = OrderHistory::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('order.items.product')->get();

        return response()->json([
            'histories' => $histories,
            'success' => true
        ], 200);
    }

    public function downloadInvoice($orderId)
    {
        $user = request()->user();
        $order = Order::where('id', $orderId)->where('user_id', $user->id)->with('items.product')->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $pdf = Pdf::loadView('invoice', compact('order'));

        $fileName = 'invoice-' . ($order->order_number ?? $order->id) . '.pdf';

        return $pdf->download($fileName);
    }
}
