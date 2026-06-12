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