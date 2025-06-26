import Swal from 'sweetalert2';

const notifica = (title, text, type) => {
    Swal.fire({
        title: title,
        text: text,
        icon: type, 
        timer: 2500, 
        timerProgressBar: true, 
        showConfirmButton: false, 
    });
};

export default notifica;
