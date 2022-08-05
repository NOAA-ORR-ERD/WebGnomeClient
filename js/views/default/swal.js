define([
    'sweetalert'
], function(swal){
    'use strict';
	var customSwal = swal.mixin({
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#aaaaaa',
    });

    return customSwal;
});
