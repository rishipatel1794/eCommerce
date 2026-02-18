<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Jobs\ImportProductsJob;
use App\Models\Order;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) request()->query('per_page', 30);
        $page = (int) request()->query('page', 1);
        $paginator = Product::orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        // append image_url on each item
        $paginator->getCollection()->transform(function ($item) {
            $item->append('image_url');
            return $item;
        });

        return response()->json([
            'products' => $paginator->items(),
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
            'success' => true
        ], 200);
    }

    public function store(StoreProductRequest $request)
    {
        if ($request->validated()) {
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'stock' => $request->stock,
                'features' => $request->features,
                'user_id' => $request->user()->id,
                'category' => $request->category,
                'rating' => $request->rating,
            ]);

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('images/products'), $imageName);
                $product->image = 'images/products/' . $imageName;
                $product->append('image_url');
                $product->save();
            } elseif ($request->external_image) {
                $product->image = $request->external_image;
                $product->append('image_url');
                $product->save();
            }

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product,
                'success' => true
            ], 201);
        } else {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $request->errors(),
                'success' => false
            ], 422);
        }
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validated();
        if ($request->hasFile('image')) {

            // Delete old image if exists
            if ($product->image && file_exists(public_path($product->image))) {
                unlink(public_path($product->image));
            }

            $image = $request->file('image');

            // Create unique name + keep original extension
            $imageName = time() . '_' . uniqid() . '.' .
                $image->getClientOriginalExtension();

            // Move to public/images/products
            $image->move(public_path('images/products'), $imageName);
            // Save path in DB
            $product->image = 'images/products/' . $imageName;
            $product->append('image_url');
        } elseif ($request->filled('external_image')) {

            if (
                $product->image && !str_starts_with($product->image, 'http')
                && file_exists(public_path($product->image))
            ) {
                unlink(public_path($product->image));
            }

            $product->image = $request->external_image;
        }

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
            'success' => true
        ], 200);
    }

    public function delete($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
                'success' => false
            ], 404);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
            'success' => true
        ], 200);
    }

    public function bulkUpload(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:51200'
        ]);

        if (!$validated) {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $request->errors(),
                'success' => false
            ], 422);
        }

        try {
            // 2. Store on a specific disk (e.g., 'local' or 'public')
            // This returns a relative path like 'uploads/filename.csv'
            if ($request->hasFile('file')) {

                $file = $request->file('file');

                $filePath = $file->store('imports', 'local');

                ImportProductsJob::dispatch(
                    $request->user()->id,
                    $filePath
                );
            }
            return response()->json([
                'message' => 'Upload started. Check back in a few moments.',
                'success' => true
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    public function orders(Request $request)
    {
        $user = request()->user();
        $orders = $user->orders()->with('items.product')->get();
        return response()->json([
            'orders' => $orders,
            'success' => true
        ], 200);
    }

    public function userProducts(Request $request)
    {
        $user = request()->user();
        $perPage = (int) request()->query('per_page', 30);
        $page = (int) request()->query('page', 1);
        $products = Product::where('user_id', $user->id)->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
        // dd($products->items());
        return response()->json([
            'products' => $products,
            'meta' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ],
            'success' => true
        ], 200);
    }

    public function totalProducts(Request $request)
    {
        $user = request()->user();
        $total = Product::where('user_id', $user->id)->count();
        return response()->json([
            'total_products' => $total,
            'success' => true
        ], 200);
    }

    public function totalSales(Request $request)
    {
        $user = request()->user();
        $totalSales = 0;
        $orders = Order::whereHas('items.product', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('items.product')->get();

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if ($item->product->user_id === $user->id) {
                    $totalSales += ($item->product->price ?? 0) * $item->quantity;
                }
            }
        }

        return response()->json([
            'total_sales' => $totalSales,
            'success' => true
        ], 200);
    }
}
