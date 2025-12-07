use pyo3::prelude::*;
use std::path::PathBuf;

pub fn resize_image_to_ratio(path: PathBuf, file_type: &str, target_width: u16, target_height: u16){
    let script = include_str!("resize_image_to_ratio.py");

    let path_string = match path.to_str() {
        Some(string) => string,
        None => return
    };
    println!("Calling resize_image_to_ratio.py ...");
    let result = Python::with_gil(|py| -> PyResult<Py<PyAny>> {
        let app: Py<PyAny> = PyModule::from_code(py, script, "", "")?.getattr("resize")?.into();
        let args = (path_string, file_type, target_width, target_height);
        app.call1(py, args)
    });

    match result {
        Err(_) => println!("An error occured while executing the script"),
        Ok(_) => println!("Called resize_image_to_ratio.py!")
    }
}
