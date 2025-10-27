import { useState, useEffect, useContext } from "react";
import PhotoListItem from "./PhotoListItem";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../userContext";
import { Grid } from "@mui/material";
import PhotoModal from "./PhotoModal";

function Home() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");
  const [photos, setPhotos] = useState([]);
  useEffect(function () {
    const getPhotos = async function () {
      const res = await fetch("http://localhost:3001/photos");
      const data = await res.json();
      setPhotos(data);
    };
    getPhotos();
  }, []);

  const handleModal = (image) => {
    setOpen(!open);
    setImage(image);
  };

  const onLikeSwitch = async (index, id) => {
    const res = await fetch("http://localhost:3001/photos/likeSwitch/" + id, {
      method: "PUT",
      credentials: "include",
      body: {},
    });
    const data = await res.json();
    let photosCopy = [...photos];
    photosCopy[index].likes = data.likes;
    setPhotos(photosCopy);
  };

  return (
    <div style={{ margin: 20 }}>
      <PhotoModal image={image} open={open} setOpen={setOpen} />
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={3} key={photos.indexOf(photo)}>
            <PhotoListItem
              photo={photo}
              onClick={handleModal}
              onLikeSwitch={onLikeSwitch}
              index={photos.indexOf(photo)}
            />
          </Grid>
        ))}
      </Grid>

      {userContext.user && (
        <Fab
          sx={{
            position: "fixed",
            bottom: (theme) => theme.spacing(2),
            right: (theme) => theme.spacing(2),
          }}
          color="primary"
          onClick={() => {
            navigate("/publish");
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </div>
  );
}

export default Photos;
