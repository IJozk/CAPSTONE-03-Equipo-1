import { ref } from 'vue'

const toast = ref({
  show: false,
  message: '',
  type: 'info'
})

export const useToast = () => {
  const showToast = (message, type = 'info', duration = 3000) => {
    toast.value = {
      show: true,
      message,
      type
    }

    setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  const hideToast = () => {
    toast.value.show = false
  }

  return {
    toast,
    showToast,
    hideToast
  }
}