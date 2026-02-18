<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // dd(request()->all());    
        // dump(request()->all());
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            // either local file or external URL required
            'image' => 'required_without:external_image|image|mimes:jpg,jpeg,png|max:2048',
            'external_image' => 'required_without:image|url',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'category' => 'required|string|max:255',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->hasFile('image') && $this->filled('external_image')) {
                $validator->errors()->add('image', 'Provide either an uploaded image or an external_image URL, not both.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'description.string' => 'Description must be a string',
            'price.required' => 'Price is required',
            'price.numeric' => 'Price must be a number',
            'price.min' => 'Price must be at least 0',
            'stock.required' => 'Stock is required',
            'stock.integer' => 'Stock must be an integer',
            'stock.min' => 'Stock must be at least 0',
            'image.required' => 'Image is required',
            'image.image' => 'File must be an image',
            'image.mimes' => 'Image must be a jpg, jpeg, or png file',
            'image.max' => 'Image size must not exceed 2048 kilobytes',
            'features.array' => 'Features must be an array',
            'features.*.string' => 'Each feature must be a string',
            'features.*.max' => 'Each feature must not exceed 255 characters',
            'rating.required' => 'Rating is required',
            'rating.integer' => 'Rating must be an integer',
            'rating.min' => 'Rating must be at least 1',
            'rating.max' => 'Rating must not exceed 5',
            'category.required' => 'Category is required',
            'category.string' => 'Category must be a string',
            'category.max' => 'Category must not exceed 255 characters',
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
