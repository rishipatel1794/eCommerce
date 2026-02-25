<?php

use Illuminate\Support\Facades\Route;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

// Register broadcasting auth route for pusher private/presence channels

Route::get('/',function(){
    return "Hello";
});
