import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Default toast configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

// Success toast
export const showSuccess = (message, title = 'Success!') => {
  return Toast.fire({
    icon: 'success',
    title: title,
    text: message,
  });
};

// Error toast
export const showError = (message, title = 'Error!') => {
  return Toast.fire({
    icon: 'error',
    title: title,
    text: message,
  });
};

// Warning toast
export const showWarning = (message, title = 'Warning!') => {
  return Toast.fire({
    icon: 'warning',
    title: title,
    text: message,
  });
};

// Info toast
export const showInfo = (message, title = 'Info') => {
  return Toast.fire({
    icon: 'info',
    title: title,
    text: message,
  });
};

// Confirmation dialog
export const showConfirm = ({
  title = 'Are you sure?',
  text = '',
  icon = 'warning',
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '#f97316',
  cancelButtonColor = '#6b7280',
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
  });
};

// Delete confirmation
export const confirmDelete = (itemName = 'this item') => {
  return Swal.fire({
    title: 'Delete Confirmation',
    text: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });
};

// Loading dialog
export const showLoading = (title = 'Please wait...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Success dialog with redirect
export const showSuccessWithRedirect = ({
  title = 'Success!',
  text = '',
  redirectUrl = '/',
  buttonText = 'Continue',
  timer = null,
}) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: buttonText,
    confirmButtonColor: '#f97316',
    timer,
    timerProgressBar: !!timer,
  }).then((result) => {
    if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
      window.location.href = redirectUrl;
    }
  });
};

// Input dialog
export const showInput = ({
  title = 'Enter value',
  inputLabel = '',
  inputPlaceholder = '',
  inputType = 'text',
  inputValue = '',
  validationMessage = 'This field is required',
}) => {
  return Swal.fire({
    title,
    input: inputType,
    inputLabel,
    inputPlaceholder,
    inputValue,
    showCancelButton: true,
    confirmButtonColor: '#f97316',
    inputValidator: (value) => {
      if (!value) {
        return validationMessage;
      }
    },
  });
};

// Custom styled alert
export const showCustom = (options) => {
  return Swal.fire({
    customClass: {
      popup: 'rounded-xl',
      confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg',
      cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg',
    },
    buttonsStyling: false,
    ...options,
  });
};

// Network error
export const showNetworkError = () => {
  return Swal.fire({
    title: 'Connection Error',
    text: 'Unable to connect to the server. Please check your internet connection and try again.',
    icon: 'error',
    confirmButtonText: 'Retry',
    confirmButtonColor: '#f97316',
  });
};

// Session expired
export const showSessionExpired = () => {
  return Swal.fire({
    title: 'Session Expired',
    text: 'Your session has expired. Please login again.',
    icon: 'warning',
    confirmButtonText: 'Login',
    confirmButtonColor: '#f97316',
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  });
};

// Image preview
export const showImagePreview = (imageUrl, title = 'Image Preview') => {
  return Swal.fire({
    title,
    imageUrl,
    imageAlt: title,
    showConfirmButton: false,
    showCloseButton: true,
  });
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  confirmDelete,
  showLoading,
  closeLoading,
  showSuccessWithRedirect,
  showInput,
  showCustom,
  showNetworkError,
  showSessionExpired,
  showImagePreview,
  MySwal,
};
