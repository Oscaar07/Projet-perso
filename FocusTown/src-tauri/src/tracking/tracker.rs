/// Détection de la fenêtre active et de l'inactivité via l'API Windows.
///
/// Utilise GetForegroundWindow pour connaître la fenêtre au premier plan,
/// GetWindowTextW pour son titre, et GetWindowModuleFileNameW pour le
/// nom du processus associé.
///
/// GetLastInputInfo est déclaré manuellement via FFI (non exposé par le
/// crate `windows` en v0.58) pour détecter l'inactivité clavier/souris.
///
/// Ces données sont consommées par le polling loop (commands/tracking.rs).

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

#[repr(C)]
struct LASTINPUTINFO {
    cb_size: u32,
    dw_time: u32,
}

extern "system" {
    fn GetLastInputInfo(plii: *mut LASTINPUTINFO) -> i32;
}

/// Retourne le dernier tick système (millisecondes depuis le boot) où
/// un événement clavier ou souris a été détecté. En comparant deux
/// appels successifs, on peut déterminer si l'utilisateur a été actif.
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
