import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
export const challengeimg = "/challenge.png";
export const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";

export function ChallengeButton(props:{username:string}):JSX.Element {
  const navigate = useNavigate();

  function createMatchAndRedirect() {
    axios.put(process.env.REACT_APP_BACKEND_URL + "match/" + props.username, {}, {
      withCredentials:true
    }).then(res => {
      if (res.data !== undefined)
        navigate("../game/" + res.data);
    }).catch(error => {
      if (error.response.status === 401 || error.response.status === 403)
        navigate("../login");
    });
  } 

  return (
    <button onClick={createMatchAndRedirect} id="challenge-button"></button>
  )
}

export function IsLogin() {
    const navigate = useNavigate();
  let logged = false;
    axios.get(process.env.REACT_APP_BACKEND_URL + "user").then(res => {

    }).catch(error => {
      //console.log(error);
      //if (error.code == 401)
      navigate("login");
    });

    return ((logged ? <Navigate to="login"></Navigate> : <></>))
}