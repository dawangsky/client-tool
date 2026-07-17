use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use uuid::Uuid;

/// 返回本机持久化的 deviceId（多端登录预留）。
/// 首次生成后写入 app data 目录，后续启动复用。
#[tauri::command]
fn get_device_id(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("mkdir: {e}"))?;
    let path: PathBuf = dir.join("device_id");
    if path.exists() {
        let id = fs::read_to_string(&path).map_err(|e| format!("read device_id: {e}"))?;
        let id = id.trim().to_string();
        if !id.is_empty() {
            return Ok(id);
        }
    }
    let id = format!("mac_{}", Uuid::new_v4());
    fs::write(&path, &id).map_err(|e| format!("write device_id: {e}"))?;
    Ok(id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // 打包后由 Rust 侧发 HTTP，绕过 WebView CORS（业务 API 仍由前端编排）
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![get_device_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
