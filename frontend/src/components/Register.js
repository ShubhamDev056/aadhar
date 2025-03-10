// import React, { useState } from "react";
// import axios from "axios";

// const Register = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:5000/v1/api/register", {
//         username,
//         email,
//         password,
//       });
//       alert("Registration Successful");
//     } catch (err) {
//       alert(err.response.data.message || "Registration Failed");
//     }
//   };

//   return (
//     // <form onSubmit={handleSubmit}>
//     //   <h2>Register</h2>
//     //   <input
//     //     type="text"
//     //     placeholder="Username"
//     //     value={username}
//     //     onChange={(e) => setUsername(e.target.value)}
//     //     required
//     //   />
//     //   <input
//     //     type="email"
//     //     placeholder="Email"
//     //     value={email}
//     //     onChange={(e) => setEmail(e.target.value)}
//     //     required
//     //   />
//     //   <input
//     //     type="password"
//     //     placeholder="Password"
//     //     value={password}
//     //     onChange={(e) => setPassword(e.target.value)}
//     //     required
//     //   />
//     //   <button type="submit">Register</button>
//     // </form>

//     <div className="container-scroller">
//       <div className="container-fluid page-body-wrapper full-page-wrapper">
//         <div className="content-wrapper d-flex align-items-center auth px-0">
//           <div className="row w-100 mx-0">
//             <div className="col-lg-4 mx-auto">
//               <div className="auth-form-light text-left py-5 px-4 px-sm-5">
//                 <div className="brand-logo">
//                   <img src="../../images/logo.svg" alt="logo" />
//                 </div>
//                 <h4>New here?</h4>
//                 <h6 className="font-weight-light">
//                   Signing up is easy. It only takes a few steps
//                 </h6>
//                 <form className="pt-3">
//                   <div className="form-group">
//                     <input
//                       type="text"
//                       className="form-control form-control-lg"
//                       id="exampleInputUsername1"
//                       placeholder="Username"
//                     />
//                   </div>
//                   <div className="form-group">
//                     <input
//                       type="email"
//                       className="form-control form-control-lg"
//                       id="exampleInputEmail1"
//                       placeholder="Email"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <input
//                       type="password"
//                       className="form-control form-control-lg"
//                       id="exampleInputPassword1"
//                       placeholder="Password"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <input
//                       type="password"
//                       className="form-control form-control-lg"
//                       id="exampleInputPassword1"
//                       placeholder="Confirm Password"
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <div className="form-check">
//                       <label className="form-check-label text-muted">
//                         <input type="checkbox" className="form-check-input" />I
//                         agree to all Terms &amp; Conditions
//                       </label>
//                     </div>
//                   </div>
//                   <div className="mt-3">
//                     <a
//                       className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
//                       href="../../index.html"
//                     >
//                       SIGN UP
//                     </a>
//                   </div>
//                   <div className="text-center mt-4 font-weight-light">
//                     Already have an account?{" "}
//                     <a href="login.html" className="text-primary">
//                       Login
//                     </a>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* content-wrapper ends */}
//       </div>
//       {/* page-body-wrapper ends */}
//     </div>
//   );
// };

// export default Register;

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the terms and conditions"),
});

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const signUpdata = {
      username: data.username,
      email: data.email,
      password: data.password,
    };
    try {
      await axios.post("http://localhost:5000/v1/api/register", {
        username: signUpdata.username,
        email: signUpdata.email,
        password: signUpdata.password,
      });
      toast.success("Registration Successful! 🎉", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <img src="../../images/logo.svg" alt="logo" />
                </div>
                <h4>New here?</h4>
                <h6 className="font-weight-light">
                  Signing up is easy. It only takes a few steps
                </h6>

                <form className="pt-3" onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Username"
                      {...register("username")}
                    />
                    {errors.username && (
                      <p className="text-danger">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-danger">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Password"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-danger">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Confirm Password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-danger">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        {...register("terms")}
                      />
                      <label className="form-check-label text-muted">
                        I agree to all Terms & Conditions
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-danger">{errors.terms.message}</p>
                    )}
                  </div>

                  <div className="mt-3">
                    <button
                      type="submit"
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    >
                      SIGN UP
                    </button>
                  </div>

                  <div className="text-center mt-4 font-weight-light">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary">
                      Login
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
