<!doctype html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #333; }
        .invoice-wrapper { max-width: 800px; margin: 0 auto; padding: 24px; }
        .header { display:flex; justify-content:space-between; align-items:center; }
        .brand { font-size: 22px; font-weight:700; color:#111; }
        .meta { text-align:right; font-size:12px; }
        .customer { margin-top:18px; padding:12px; background:#f7f7f7; border-radius:6px; }
        table { width:100%; border-collapse:collapse; margin-top:18px; }
        th, td { padding:10px; border:1px solid #e0e0e0; vertical-align:middle; }
        th { background:#fafafa; text-align:left; font-size:13px; }
        .product-image { width:80px; height:60px; object-fit:cover; border-radius:4px; }
        .right { text-align:right; }
        .summary { margin-top:18px; float:right; width:320px; }
        .summary table td { border:none; padding:6px 10px; }
        .total-row { font-weight:700; font-size:16px; border-top:1px solid #ddd; }
        .small { font-size:12px; color:#666; }
        .features { font-size:12px; color:#555; margin:6px 0 0 0; list-style:disc; margin-left:18px; }
        footer { margin-top:40px; font-size:12px; color:#777; text-align:center; }
    </style>
</head>
<body>
    <div class="invoice-wrapper">
        <div class="header">
            <div>
                <div class="brand">ShopHub</div>
                <div class="small">Invoice</div>
            </div>
            <div class="meta">
                <div>Invoice #: <strong>{{ $order->order_number ?? $order->id }}</strong></div>
                <div>Date: <strong>{{ isset($order->created_at) ? $order->created_at->format('d M Y') : now()->format('d M Y') }}</strong></div>
                <div class="small">Order ID: {{ $order->id }}</div>
            </div>
        </div>

        <div class="customer">
            <strong>Bill To</strong>
            <div>{{ $order->user->name ?? 'Customer Name' }}</div>
            <div class="small">{{ $order->user->email ?? '' }}</div>
        </div>

        @php
            $subtotal = 0;
        @endphp

        <table>
            <thead>
                <tr>
                    <th style="width:100px">Item</th>
                    <th>Details</th>
                    <th class="right">Price</th>
                    <th class="right">Qty</th>
                    <th class="right">Line Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    @php
                        $line = ($item->price ?? 0) * ($item->quantity ?? 1);
                        $subtotal += $line;
                        $features = $item->product->features ?? null;
                        if (is_string($features)) {
                            $decoded = json_decode($features, true);
                            if (json_last_error() === JSON_ERROR_NONE) $features = $decoded;
                        }
                    @endphp
                    <tr>
                        <td>
                            @if(!empty($item->product->image))
                                <img src="{{ $item->product->image }}" class="product-image" alt="{{ $item->product->name }}">
                            @else
                                <div style="width:80px;height:60px;background:#eee;border-radius:4px"></div>
                            @endif
                        </td>
                        <td>
                            <div style="font-weight:600">{{ $item->product->name ?? 'Product' }}</div>
                            <div class="small">Category: {{ $item->product->category ?? '-' }}</div>
                            @if(!empty($item->product->description))
                                <div class="small">{{ Str::limit($item->product->description, 140) }}</div>
                            @endif
                            @if(!empty($features) && is_array($features))
                                <ul class="features">
                                    @foreach($features as $f)
                                        <li>{{ $f }}</li>
                                    @endforeach
                                </ul>
                            @endif
                        </td>
                        <td class="right">Rs. {{ number_format($item->price, 2) }}</td>
                        <td class="right">{{ $item->quantity }}</td>
                        <td class="right">Rs. {{ number_format($line, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary">
            <table>
                <tr>
                    <td class="small">Subtotal:</td>
                    <td class="right">Rs. {{ number_format($subtotal, 2) }}</td>
                </tr>
                @php
                    $shipping = ($subtotal > 100) ? 0 : 10;
                    $grand = $subtotal + $shipping;
                @endphp
                <tr>
                    <td class="small">Shipping:</td>
                    <td class="right">Rs. {{ number_format($shipping, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Total:</td>
                    <td class="right">Rs. {{ number_format($order->total ?? $grand, 2) }}</td>
                </tr>
            </table>
        </div>

        <div style="clear:both"></div>

        <footer>
            Thank you for your purchase — if you have questions, contact support@yourshop.example
        </footer>
    </div>
</body>
</html>
