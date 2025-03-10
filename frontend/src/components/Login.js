import React from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CryptoJS from "crypto-js"; // Import CryptoJS
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SECRET_KEY = "my-secret-key"; // Use a secure key (same as backend)

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const { email, password } = data;

    // Encrypt the password using AES encryption
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      SECRET_KEY
    ).toString();
    console.log("encryptedPassword", encryptedPassword);

    try {
      const res = await axios.post("http://localhost:5000/v1/api/login", {
        email,
        password: encryptedPassword, // Send encrypted password
      });
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid login credentials.", {
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
                <h4>Hello! Let's get started</h4>
                <h6 className="font-weight-light">Sign in to continue.</h6>
                <form className="pt-3" onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      {...register("email")}
                      placeholder="Email"
                    />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      {...register("password")}
                      placeholder="Password"
                    />
                    <p className="text-danger">{errors.password?.message}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="submit"
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    >
                      SIGN IN
                    </button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center">
                    <div className="form-check"></div>
                  </div>
                  <div className="text-center mt-4 font-weight-light">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary">
                      Create
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* content-wrapper ends */}
      </div>
      {/* page-body-wrapper ends */}
    </div>
  );
};

export default Login;
