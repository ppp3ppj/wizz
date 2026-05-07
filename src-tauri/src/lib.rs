use std::path::PathBuf;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Finds the Microsoft Edge executable on Windows.
fn find_edge() -> Option<PathBuf> {
    let candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ];
    candidates
        .iter()
        .map(PathBuf::from)
        .find(|p| p.exists())
}

/// Saves the invoice as a PDF using Edge headless.
/// The dialog is shown natively via tauri-plugin-dialog.
/// Runs entirely on a Rust background thread — the JS main thread is never blocked.
#[tauri::command]
fn save_invoice_pdf(
    app: tauri::AppHandle,
    html: String,
    filename: String,
) -> Result<bool, String> {
    use tauri_plugin_dialog::DialogExt;

    // Show native Windows save-file dialog
    let file_path = app
        .dialog()
        .file()
        .set_file_name(&filename)
        .add_filter("PDF Document", &["pdf"])
        .blocking_save_file();

    let save_path = match file_path {
        Some(p) => p,
        None => return Ok(false), // user cancelled
    };

    let save_path_str = save_path
        .into_path()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string();

    // Write the HTML to a temp file that Edge can open as file://
    let temp_html = std::env::temp_dir().join("wizz_invoice.html");

    let full_html = format!(
        r#"<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html, body {{ background: white; }}
  @page {{ size: A4 portrait; margin: 0; }}
</style>
</head>
<body>{}</body>
</html>"#,
        html
    );

    std::fs::write(&temp_html, full_html.as_bytes())
        .map_err(|e| format!("Failed to write temp HTML: {e}"))?;

    let edge = find_edge().ok_or("Microsoft Edge not found on this system")?;

    let temp_url = format!(
        "file:///{}",
        temp_html
            .to_str()
            .unwrap_or("")
            .replace('\\', "/")
    );

    let output = std::process::Command::new(&edge)
        .args([
            "--headless=old",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=3000",
            "--print-to-pdf-no-header",
            "--no-margins",
            // A4 in inches: 210mm = 8.27in, 297mm = 11.69in
            "--paper-width=8.27",
            "--paper-height=11.69",
            &format!("--print-to-pdf={save_path_str}"),
            &temp_url,
        ])
        .output()
        .map_err(|e| format!("Failed to launch Edge: {e}"))?;

    // Clean up temp file regardless of outcome
    let _ = std::fs::remove_file(&temp_html);

    if std::path::Path::new(&save_path_str).exists() {
        Ok(true)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Edge failed to generate PDF: {stderr}"))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, save_invoice_pdf])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
