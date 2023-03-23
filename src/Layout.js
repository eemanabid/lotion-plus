import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import NoteList from "./NoteList";
import Empty from "./Empty";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "./utils";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const localStorageKey = "lotion-v1";

function Layout() {
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  const [collapse, setCollapse] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  useEffect(() => {
    const height = mainContainerRef.current.offsetHeight;
    mainContainerRef.current.style.maxHeight = `${height}px`;
    const existing = localStorage.getItem(localStorageKey);
    if (existing) {
      try {
        setNotes(JSON.parse(existing));
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (currentNote < 0) {
      return;
    }
    if (!editMode) {
      navigate(`/notes/${currentNote + 1}`);
      return;
    }
    navigate(`/notes/${currentNote + 1}/edit`);
  }, [notes]);

  const saveNote = async (note, index) => {
    const { title, body, when } = note;
    const newNote = {title, body, when, id: uuidv4()};
    note.body = note.body.replaceAll("<p><br></p>", "");
    setNotes([
      ...notes.slice(0, index),
      { ...note },
      ...notes.slice(index + 1),
    ]);
    setCurrentNote(index);
    setEditMode(false);
    
    // send the note to the backend
    const res = await fetch("https://et34tcnpyxh5rmedwdfcoxsmpe0rmmfa.lambda-url.ca-central-1.on.aws/",
      {
        method: "POST",
        headers:{
          "Content-Type": "application/json"
        },
        body: JSON.stringify({...newNote, email: profile.email})
      }
    );

    const jsonRes = await res.json();
    console.log(jsonRes);
  };

  const deleteNote = (index) => {
    setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
    setCurrentNote(0);
    setEditMode(false);
  };

  const addNote = () => {
    setNotes([
      {
        id: uuidv4(),
        title: "Untitled",
        body: "",
        when: currentDate(),
      },
      ...notes,
    ]);
    setEditMode(true);
    setCurrentNote(0);
  };

  return (
    <div id="container">
      <header>
        <aside>
          <button id="menu-button" onClick={() => setCollapse(!collapse)}>
            &#9776;
          </button>
        </aside>
        <div id="app-header">
          <h1>
            <Link to="/notes">Lotion</Link>
          </h1>
          <h6 id="app-moto">Like Notion, but worse.</h6>
        </div>

        {profile ? (
          <div className="profile">
            <div>{profile.email}</div>
            <button className="log" onClick={logOut}>Log out</button>
          </div>
        ) : (
          <></>
        )}

        <aside>&nbsp;</aside>
      </header>
      <div id="main-container" ref={mainContainerRef}>
      {profile ? (
         <aside id="sidebar" className={collapse ? "hidden" : null}>
         <header>
           <div id="notes-list-heading">
             <h2>Notes</h2>
             <button id="new-note-button" onClick={addNote}>
               +
             </button>
           </div>
         </header>
         <div id="notes-holder">
           <NoteList notes={notes} />
         </div>
       </aside>
        ) : (
          <></>
        )}

        <div id="write-box">
        {profile ? (
         <Outlet context={[notes, saveNote, deleteNote]} />
        ) : (
          
          <div id="login-button-div"> 
            <button id="login-button" onClick={() => login()}>Sign in with Google </button> 
            </div>
        )}
          
        </div>
      </div>
    </div>
  );
}

export default Layout;
