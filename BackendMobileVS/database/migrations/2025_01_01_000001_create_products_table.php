<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->json('sizes');
            $table->string('image'); // Singular image URL
            $table->enum('category', ['TOUT', 'MARIAGE', 'BUSINESS', 'SOIRÉE', 'ACCESSOIRES'])->default('TOUT');
            $table->string('tag')->nullable(); // e.g., 'POPULAIRE', 'NOUVEAU'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
