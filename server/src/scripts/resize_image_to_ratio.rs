use std::path::PathBuf;
use opencv::boxed_ref::BoxedRef;
use opencv::imgcodecs::*;
use opencv::imgproc::*;
use opencv::prelude::*;
use opencv::core::*;

use std::fs::File;
use std::io::Write;

pub fn resize_image_to_ratio(path: PathBuf, file_type: &str, target_width: i32, target_height: i32){
    let path_string = match path.to_str() {
        Some(string) => string,
        None => return
    };

    println!("Resizing image");

    let image = match imread(path_string, 1) {
        Ok(image) => image,
        Err(_) => return
    };

    let (width, height) = {
        let size = image.size().unwrap();
        (size.width as i32, size.height as i32)
    };

    println!("width: {}, height: {}", width, height);

    let actual_ratio =  width as f32 / height as f32;
    let target_ratio = target_width as f32 / target_height as f32;
    let roi: BoxedRef<Mat> = if !is_close::default().is_close(actual_ratio, target_ratio){
        println!("wrong ratio: {}", actual_ratio);
        println!("actual ratio: {}", target_ratio);
        let (from_height, from_width, roi_width, roi_height) = if actual_ratio > target_ratio {
            let roi_width = (target_ratio * height as f32) as i32;
            let from_width = (width - roi_width) / 2;
            (0, from_width, roi_width, height)
        } else {
            let roi_height = (width as f32 / target_ratio) as i32;
            let from_height = (height - roi_height) / 2;
            (from_height, 0, width, roi_height)
        };

        match Mat::roi(&image, Rect{
            x: from_width,
            y: from_height,
            width: roi_width,
            height:roi_height 
        }){
            Ok(image) => image,
            Err(err) => {
                println!("{}", err);
                return;
            }
        }
    } else {
        image.into()
    };

    let mut buffer = Mat::default();
    match resize(&roi, &mut buffer, Size{ width: target_width, height: target_height }, 0.0, 0.0, opencv::imgproc::INTER_LINEAR){
        Err(err) => {
            println!("{}", err);
            return;
        },
        Ok(_) => {}
    }

    let mut encoded_buffer = Vector::<u8>::new();

    let mut params = Vector::<i32>::new();
    params.push(IMWRITE_WEBP_QUALITY);
    params.push(100);

    match imencode(file_type, &buffer, &mut encoded_buffer, &params){
        Err(err) => {
            println!("{}", err);
            return;
        },
        Ok(_) => {}
    }

    save_image(path_string, &encoded_buffer.as_slice());

    println!("Successfully resized image");
}

fn save_image(path_string: &str, buffer: &[u8]){
    let mut out_file = match File::create(path_string){
        Ok(file) => file,
        Err(err) => { 
            println!("{}", err);
            return;
        }
    };
 
    match out_file.write_all(buffer){
        Err(err) => {
            println!("{}", err); 
            return;
        },
        Ok(_) => {}
    }
}
