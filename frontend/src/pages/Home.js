import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Home = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    // Handle login logic here
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
                    <a href="register.html" className="text-primary">
                      Create
                    </a>
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

export default Home;
