import logo_pic from "../../assets/logo.jpeg";

function Logo(){
    return(
         <center><img src={logo_pic}  style={{width: '100px', zIndex: 20, position: "relative", marginBottom: '5px',borderRadius: '15px'   }}/></center> 
    )
}
export default Logo