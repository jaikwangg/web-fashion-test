import React, { useState } from "react";
import axios from "axios";
import './uploader.css'; 
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';

const FashionRecommendation = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recommendedImages, setRecommendedImages] = useState([]);
  const [fileName, setFileName] = useState("No selected file");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await axios.post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setRecommendedImages(response.data.recommendedImages);
      } catch (error) {
        console.error("Error uploading the file:", error);
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: 'Black' }}>Fashion<br />Recommender</h1>

      <main>
        <form
          action=""
          onClick={() => document.querySelector(".input-field").click()}
        >
          <input 
            type="file" 
            accept='image/*' 
            className='input-field' 
            hidden
            onChange={handleFileChange}
          />

          {uploadedImage ? (
            <img src={uploadedImage} width={150} height={150} alt={fileName} />
          ) : (
            <>
              <MdCloudUpload color='#000000' size={60} />
              <p>Browse Files to upload</p>
            </>
          )}
        </form>

        <section className='uploaded-row'>
          <AiFillFileImage color='#000000' />
          <span className='upload-content'>
            {fileName} - 
            <MdDelete
              onClick={() => {
                setFileName("No selected File");
                setUploadedImage(null);
                setSelectedFile(null);
              }}
            />
          </span>
        </section>

        <button 
          onClick={handleUpload}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          Upload and Get Recommendations
        </button>

        {recommendedImages.length > 0 && (
          <>
            <h2>Recommended Images</h2>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {recommendedImages.map((image, index) => (
                <div key={index}>
                  <img src={image} alt={`Recommendation ${index + 1}`} width="200" />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FashionRecommendation;
