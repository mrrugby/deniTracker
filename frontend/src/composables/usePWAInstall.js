import { ref, onMounted } from 'vue';
export function  usePWAInstall(){
    const deferredPrompt = ref(null)

    onMounted(() =>{
        window.addEventListener("beforeinstallprompt", (e) =>{
            e.preventDefault()
            deferredPrompt.value = e
        })
    })

    const promptInstall = async () =>{
        if(!deferredPrompt.value) return 
        deferredPrompt.value.prompt()

        const { outcome } = await deferredPrompt.value.userChoice
        if (outcome === "accepted"){
            console.log("user installed debtly")
        }
        deferredPrompt.value = null
    }

    return {
        deferredPrompt,
        promptInstall
    }
}