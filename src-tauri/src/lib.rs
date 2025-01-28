use futures_util::StreamExt;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tauri::{command, Emitter, Manager, Window};
use tokio::sync::Mutex;

static CHARACTER_PROFILES: Lazy<Arc<Mutex<HashMap<&str, (&str, f64)>>>> = Lazy::new(|| {
    Arc::new(Mutex::new({
        let mut m = HashMap::new();
        m.insert(
            "lain", 
            (
                "[CYBER PROTOCOL ACTIVATED]\nCONTEXT: %CONTEXT%\nRESPONSE TYPE: Cryptic, fragmented, philosophical\nQUERY: ",
                0.92
            )
        );
        m.insert(
            "mikasa",
            (
                "[COMBAT MODE ENGAGED]\nCONTEXT: %CONTEXT%\nRESPONSE TYPE: Direct, protective, combat-focused\nQUERY: ",
                0.75
            )
        );
        m.insert(
            "saber",
            (
                "[CHIVALRY PROTOCOL INITIATED]\nCONTEXT: %CONTEXT%\nRESPONSE TYPE: Noble, formal, strategic\nQUERY: ",
                1.0
            )
        );
        m.insert(
            "asuna",
            (
                "[VIRTUAL REALITY SYNCHRONIZED]\nCONTEXT: %CONTEXT%\nRESPONSE TYPE: Supportive, emotional, cooperative\nQUERY: ",
                0.85
            )
        );
        m.insert(
            "erza",
            (
                "[REQUIP SYSTEM ONLINE]\nCONTEXT: %CONTEXT%\nRESPONSE TYPE: Confident, battle-ready, loyal\nQUERY: ",
                0.88
            )
        );
        m
    }))
});

static CHAT_HISTORY: Lazy<Arc<Mutex<Vec<String>>>> =
    Lazy::new(|| Arc::new(Mutex::new(Vec::with_capacity(5))));

#[derive(Debug, Serialize, Deserialize)]
struct OllamaChunk {
    response: String,
    done: bool,
}

#[command]
async fn ask_ai(window: Window, prompt: String, character: String) -> Result<(), String> {
    let profiles = CHARACTER_PROFILES.lock().await;
    let (base_prompt, temp) = profiles.get(&*character).ok_or("Invalid character")?;

    let history = CHAT_HISTORY.lock().await;
    let context = history.join("\n");
    let full_prompt = base_prompt.replace("%CONTEXT%", &context) + &prompt;

    call_ollama(window.clone(), full_prompt, *temp as f64).await?;

    Ok(())
}

async fn call_ollama(window: Window, full_prompt: String, temperature: f64) -> Result<(), String> {
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&serde_json::json!({
            "model": "deepseek-r1:7b",
            "prompt": full_prompt,
            "stream": true,
            "temperature": temperature,
        }))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let mut stream = response.bytes_stream();
    let mut buffer = String::new();
    let mut full_response = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        let chunk_str = String::from_utf8_lossy(&chunk);

        buffer.push_str(&chunk_str);

        while let Some(newline_pos) = buffer.find('\n') {
            let line = buffer.drain(..=newline_pos).collect::<String>();
            let trimmed_line = line.trim();

            if trimmed_line.is_empty() {
                continue;
            }

            match serde_json::from_str::<OllamaChunk>(trimmed_line) {
                Ok(data) => {
                    window
                        .emit("ai_chunk", &data.response)
                        .map_err(|e| e.to_string())?;
                    full_response.push_str(&data.response);

                    if data.done {
                        window.emit("ai_end", ()).map_err(|e| e.to_string())?;
                        return Ok(());
                    }
                }
                Err(e) => {
                    window
                        .emit("ai_error", format!("JSON error: {}", e))
                        .map_err(|e| e.to_string())?;
                }
            }
        }
    }

    if !buffer.is_empty() {
        if let Ok(data) = serde_json::from_str::<OllamaChunk>(&buffer) {
            window
                .emit("ai_chunk", &data.response)
                .map_err(|e| e.to_string())?;
            full_response.push_str(&data.response);
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ask_ai])
        .setup(|app| {
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error running application");
}
