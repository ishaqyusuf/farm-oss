use std::env;

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

fn app_url() -> String {
    match env::var("FARM_OSS_ENV")
        .unwrap_or_else(|_| String::from("development"))
        .to_lowercase()
        .as_str()
    {
        "staging" => String::from("https://staging.farm-oss.app"),
        "production" | "prod" => String::from("https://app.farm-oss.app"),
        _ => String::from("http://localhost:3901"),
    }
}

#[tauri::command]
fn get_environment_url() -> String {
    app_url()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let url = app_url();

            let window = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External(url.parse().expect("valid desktop target url")),
            )
            .title("Farm OSS")
            .inner_size(1440.0, 920.0)
            .min_inner_size(1100.0, 760.0)
            .build()?;

            #[cfg(target_os = "macos")]
            {
                let _ = window.set_title_bar_style(tauri::TitleBarStyle::Transparent);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_environment_url])
        .run(tauri::generate_context!())
        .expect("error while running farm oss desktop app");
}

