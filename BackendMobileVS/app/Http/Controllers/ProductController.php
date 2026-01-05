<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // 1. Initialiser la requête
        $query = Product::query();

        // 2. LOGIQUE DE FILTRAGE
        // Si le paramètre 'category' est présent dans l'URL
        if ($request->has('category')) {
            $cat = $request->category;
            
            // Si ce n'est pas "TOUT", on filtre
            // On s'assure que la comparaison est exacte (Laravel gère les accents comme É/E selon la config, mais restons stricts)
            if ($cat !== 'TOUT') {
                $query->where('category', $cat);
            }
        }

        // 3. Retourner les résultats (du plus récent au plus vieux)
        return $query->latest()->get();
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'sizes' => 'required|array',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Single image
            'category' => 'required|in:TOUT,MARIAGE,BUSINESS,SOIRÉE,ACCESSOIRES',
            'tag' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('uploads', 'public');
            $imagePath = asset('storage/' . $path);
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sizes' => $request->sizes,
            'image' => $imagePath,
            'category' => $request->category,
            'tag' => $request->tag,
            'is_featured' => $request->is_featured ?? false,
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric',
            'sizes' => 'array',
            'image' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'category' => 'required|in:TOUT,MARIAGE,BUSINESS,SOIRÉE,ACCESSOIRES',
            'tag' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('uploads', 'public');
            $data['image'] = asset('storage/' . $path);
        }
        
        $product->update($data);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
    public function featured()
    {
        $products = Product::where('is_featured', true)->latest()->get();
        return response()->json($products);
    }
}
