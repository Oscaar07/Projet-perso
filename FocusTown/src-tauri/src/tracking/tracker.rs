use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW, GetWindowModuleFileNameW};
use serde::Serialize;
use std::path::Path;

#[derive(Clone, Serialize)]
pub struct WindowInfo {
    pub title:String,
    pub process_name:String
}

pub fn get_active_window() -> WindowInfo {
    unsafe {
        let hwnd: HWND = GetForegroundWindow();
        
        let mut title_buf = [0u16; 512];
        let len = GetWindowTextW(hwnd, &mut title_buf);
        let title = String::from_utf16_lossy(&title_buf[..len as usize]);
        
        let mut module_buf = [0u16; 512];
        let len = GetWindowModuleFileNameW(hwnd, &mut module_buf);
        let path = String::from_utf16_lossy(&module_buf[..len as usize]);
        let process_name = Path::new(&path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        
        WindowInfo { title, process_name }
    }
}

// GetLastInputInfo n'est pas exposé par le crate windows v0.58,
// on déclare l'FFI manuellement.
#[repr(C)]
struct LASTINPUTINFO {
    cb_size: u32,
    dw_time: u32,
}

extern "system" {
    fn GetLastInputInfo(plii: *mut LASTINPUTINFO) -> i32;
}

/// Retourne le tick système (ms depuis le boot) du dernier input clavier/souris.
/// Comparé entre deux appels, permet de savoir si un nouvel input a eu lieu.
pub fn get_last_input_tick() -> u32 {
    unsafe {
        let mut lii = LASTINPUTINFO {
            cb_size: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dw_time: 0,
        };
        let _ = GetLastInputInfo(&mut lii);
        lii.dw_time
    }
}
