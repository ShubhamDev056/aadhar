import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import CryptoJS from "crypto-js";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const secretKey = "your-secure-key"; // Store securely, avoid exposing it in frontend

const decryptAadhar = (encryptedAadhar) => {
  const bytes = CryptoJS.AES.decrypt(encryptedAadhar, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptAadhar = (aadhar) => {
  return CryptoJS.AES.encrypt(aadhar, secretKey).toString();
};

// Verhoeff algorithm tables
const verhoeffTableD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const verhoeffTableP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const verhoeffTableInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

const aadharValidation = (aadhar) => {
  const sanitizedAadhar = aadhar.replace(/-/g, "");
  if (!/^[2-9]{1}[0-9]{11}$/.test(sanitizedAadhar)) {
    return false;
  }
  let c = 0;
  const reversed = sanitizedAadhar.split("").reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = verhoeffTableD[c][verhoeffTableP[i % 8][reversed[i]]];
  }
  return c === 0;
};

const schema = yup.object().shape({
  name: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Name must contain only letters")
    .required("Name is required"),
  age: yup
    .number()
    .min(5, "Age must be at least 5 years")
    .max(125, "Age must be below 125 years")
    .required("Age is required"),
  aadhar: yup
    .string()
    .matches(
      /^([2-9]{1}[0-9]{3}-){2}[0-9]{4}$|^[2-9]{1}[0-9]{11}$/,
      "Invalid Aadhaar format as per UDID"
    )
    .test(
      "valid-aadhar",
      "Invalid Aadhaar number as per UDID",
      (value) => value && aadharValidation(value)
    ),
});

const AddAadhar = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [aadhar, setAadhar] = useState("");
  const [aadharData, setAadharData] = useState([]);

  const formatAadhar = (value) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 12);
    return sanitized.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3").trim();
  };

  const handleAadharChange = (e) => {
    const formatted = formatAadhar(e.target.value);
    setAadhar(formatted);
    setValue("aadhar", formatted, { shouldValidate: true });
  };
  useEffect(() => {
    fetchAadharDetails();
  }, []);

  const onSubmit = async (data) => {
    const encryptedAadhar = encryptAadhar(data.aadhar);

    // Replace the Aadhaar with encrypted data before sending
    const payload = { ...data, aadhar: encryptedAadhar };
    console.log("payload", payload);

    try {
      const res = await axiosInstance.post(
        "aadhar/insert-aadhar-details",
        payload
      );
      toast.success("Aadhar details Successful saved!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchAadharDetails();

      //setError(null); // Clear any previous errors
    } catch (err) {
      toast.error(err.response?.data?.message || "internal server error", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchAadharDetails = async () => {
    try {
      const res = await axiosInstance.get("aadhar/get-aadhar-details");
      console.log("res!!!!!", res);
      setAadharData(res.data);

      // setUsers(res.data);
      //setError(null); // Clear any previous errors
    } catch (err) {
      //handleError(err);
    }
  };
  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use 12-hour format with AM/PM
    });
  };
  const maskAadhar = (aadhar) => {
    const sanitizedAadhar = aadhar.replace(/-/g, ""); // Remove hyphens if present
    if (sanitizedAadhar.length === 12) {
      return "XXXX-XXXX-" + sanitizedAadhar.slice(8);
    }
    return aadhar; // Return original if format is incorrect
  };

  const aadharList = aadharData.map((data, i) => {
    const encryptedAadhar = data.aadhar;
    console.log("encryptedAadhar", encryptedAadhar);
    const decryptedAadhar = decryptAadhar(data.aadhar);
    console.log("Decrypted Aadhaar:", decryptedAadhar);
    return (
      <tr>
        <td>{i}</td>
        <td>Shubham</td>
        <td>{maskAadhar(decryptedAadhar)}</td>
        <td>{data.age}</td>
        <td>{formatDate(data.createdAt)}</td>
      </tr>
    );
  });

  return (
    <div className="container-scroller">
      {/* partial:partials/_navbar.html */}
      <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
          <Link className="navbar-brand brand-logo mr-5" to="/dashboard">
            <img src="images/logo.svg" className="mr-2" alt="logo" />
          </Link>
          <a className="navbar-brand brand-logo-mini" href="index.html">
            <img src="images/logo-mini.svg" alt="logo" />
          </a>
        </div>
        <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
            data-toggle="minimize"
          >
            <span className="icon-menu" />
          </button>
          <ul className="navbar-nav mr-lg-2">
            <li className="nav-item nav-search d-none d-lg-block">
              <div className="input-group">
                <div
                  className="input-group-prepend hover-cursor"
                  id="navbar-search-icon"
                >
                  <span className="input-group-text" id="search">
                    <i className="icon-search" />
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  id="navbar-search-input"
                  placeholder="Search now"
                  aria-label="search"
                  aria-describedby="search"
                />
              </div>
            </li>
          </ul>
          <ul className="navbar-nav navbar-nav-right">
            <li className="nav-item dropdown">
              <a
                className="nav-link count-indicator dropdown-toggle"
                id="notificationDropdown"
                href="#"
                data-toggle="dropdown"
              >
                <i className="icon-bell mx-0" />
                <span className="count" />
              </a>
              <div
                className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
                aria-labelledby="notificationDropdown"
              >
                <p className="mb-0 font-weight-normal float-left dropdown-header">
                  Notifications
                </p>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-success">
                      <i className="ti-info-alt mx-0" />
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <h6 className="preview-subject font-weight-normal">
                      Application Error
                    </h6>
                    <p className="font-weight-light small-text mb-0 text-muted">
                      Just now
                    </p>
                  </div>
                </a>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-warning">
                      <i className="ti-settings mx-0" />
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <h6 className="preview-subject font-weight-normal">
                      Settings
                    </h6>
                    <p className="font-weight-light small-text mb-0 text-muted">
                      Private message
                    </p>
                  </div>
                </a>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-info">
                      <i className="ti-user mx-0" />
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <h6 className="preview-subject font-weight-normal">
                      New user registration
                    </h6>
                    <p className="font-weight-light small-text mb-0 text-muted">
                      2 days ago
                    </p>
                  </div>
                </a>
              </div>
            </li>
            <li className="nav-item nav-profile dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-toggle="dropdown"
                id="profileDropdown"
              >
                <img src="images/faces/face28.jpg" alt="profile" />
              </a>
              <div
                className="dropdown-menu dropdown-menu-right navbar-dropdown"
                aria-labelledby="profileDropdown"
              >
                <a className="dropdown-item">
                  <i className="ti-settings text-primary" />
                  Settings
                </a>
                <a className="dropdown-item" onClick={handleLogout}>
                  <i className="ti-power-off text-primary" />
                  Logout
                </a>
              </div>
            </li>
            <li className="nav-item nav-settings d-none d-lg-flex">
              <a className="nav-link" href="#">
                <i className="icon-ellipsis" />
              </a>
            </li>
          </ul>
          <button
            className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
            type="button"
            data-toggle="offcanvas"
          >
            <span className="icon-menu" />
          </button>
        </div>
      </nav>
      {/* partial */}
      <div className="container-fluid page-body-wrapper">
        {/* partial:partials/_settings-panel.html */}
        <div className="theme-setting-wrapper">
          <div id="settings-trigger">
            <i className="ti-settings" />
          </div>
          <div id="theme-settings" className="settings-panel">
            <i className="settings-close ti-close" />
            <p className="settings-heading">SIDEBAR SKINS</p>
            <div
              className="sidebar-bg-options selected"
              id="sidebar-light-theme"
            >
              <div className="img-ss rounded-circle bg-light border mr-3" />
              Light
            </div>
            <div className="sidebar-bg-options" id="sidebar-dark-theme">
              <div className="img-ss rounded-circle bg-dark border mr-3" />
              Dark
            </div>
            <p className="settings-heading mt-2">HEADER SKINS</p>
            <div className="color-tiles mx-0 px-4">
              <div className="tiles success" />
              <div className="tiles warning" />
              <div className="tiles danger" />
              <div className="tiles info" />
              <div className="tiles dark" />
              <div className="tiles default" />
            </div>
          </div>
        </div>
        <div id="right-sidebar" className="settings-panel">
          <i className="settings-close ti-close" />
          <ul
            className="nav nav-tabs border-top"
            id="setting-panel"
            role="tablist"
          >
            <li className="nav-item">
              <a
                className="nav-link active"
                id="todo-tab"
                data-toggle="tab"
                href="#todo-section"
                role="tab"
                aria-controls="todo-section"
                aria-expanded="true"
              >
                TO DO LIST
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="chats-tab"
                data-toggle="tab"
                href="#chats-section"
                role="tab"
                aria-controls="chats-section"
              >
                CHATS
              </a>
            </li>
          </ul>
          <div className="tab-content" id="setting-content">
            <div
              className="tab-pane fade show active scroll-wrapper"
              id="todo-section"
              role="tabpanel"
              aria-labelledby="todo-section"
            >
              <div className="add-items d-flex px-3 mb-0">
                <form className="form w-100">
                  <div className="form-group d-flex">
                    <input
                      type="text"
                      className="form-control todo-list-input"
                      placeholder="Add To-do"
                    />
                    <button
                      type="submit"
                      className="add btn btn-primary todo-list-add-btn"
                      id="add-task"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
              <div className="list-wrapper px-3">
                <ul className="d-flex flex-column-reverse todo-list">
                  <li>
                    <div className="form-check">
                      <label className="form-check-label">
                        <input className="checkbox" type="checkbox" />
                        Team review meeting at 3.00 PM
                      </label>
                    </div>
                    <i className="remove ti-close" />
                  </li>
                  <li>
                    <div className="form-check">
                      <label className="form-check-label">
                        <input className="checkbox" type="checkbox" />
                        Prepare for presentation
                      </label>
                    </div>
                    <i className="remove ti-close" />
                  </li>
                  <li>
                    <div className="form-check">
                      <label className="form-check-label">
                        <input className="checkbox" type="checkbox" />
                        Resolve all the low priority tickets due today
                      </label>
                    </div>
                    <i className="remove ti-close" />
                  </li>
                  <li className="completed">
                    <div className="form-check">
                      <label className="form-check-label">
                        <input
                          className="checkbox"
                          type="checkbox"
                          defaultChecked
                        />
                        Schedule meeting for next week
                      </label>
                    </div>
                    <i className="remove ti-close" />
                  </li>
                  <li className="completed">
                    <div className="form-check">
                      <label className="form-check-label">
                        <input
                          className="checkbox"
                          type="checkbox"
                          defaultChecked
                        />
                        Project review
                      </label>
                    </div>
                    <i className="remove ti-close" />
                  </li>
                </ul>
              </div>
              <h4 className="px-3 text-muted mt-5 font-weight-light mb-0">
                Events
              </h4>
              <div className="events pt-4 px-3">
                <div className="wrapper d-flex mb-2">
                  <i className="ti-control-record text-primary mr-2" />
                  <span>Feb 11 2018</span>
                </div>
                <p className="mb-0 font-weight-thin text-gray">
                  Creating component page build a js
                </p>
                <p className="text-gray mb-0">The total number of sessions</p>
              </div>
              <div className="events pt-4 px-3">
                <div className="wrapper d-flex mb-2">
                  <i className="ti-control-record text-primary mr-2" />
                  <span>Feb 7 2018</span>
                </div>
                <p className="mb-0 font-weight-thin text-gray">
                  Meeting with Alisa
                </p>
                <p className="text-gray mb-0 ">Call Sarah Graves</p>
              </div>
            </div>
            {/* To do section tab ends */}
            <div
              className="tab-pane fade"
              id="chats-section"
              role="tabpanel"
              aria-labelledby="chats-section"
            >
              <div className="d-flex align-items-center justify-content-between border-bottom">
                <p className="settings-heading border-top-0 mb-3 pl-3 pt-0 border-bottom-0 pb-0">
                  Friends
                </p>
                <small className="settings-heading border-top-0 mb-3 pt-0 border-bottom-0 pb-0 pr-3 font-weight-normal">
                  See All
                </small>
              </div>
              <ul className="chat-list">
                <li className="list active">
                  <div className="profile">
                    <img src="images/faces/face1.jpg" alt="image" />
                    <span className="online" />
                  </div>
                  <div className="info">
                    <p>Thomas Douglas</p>
                    <p>Available</p>
                  </div>
                  <small className="text-muted my-auto">19 min</small>
                </li>
                <li className="list">
                  <div className="profile">
                    <img src="images/faces/face2.jpg" alt="image" />
                    <span className="offline" />
                  </div>
                  <div className="info">
                    <div className="wrapper d-flex">
                      <p>Catherine</p>
                    </div>
                    <p>Away</p>
                  </div>
                  <div className="badge badge-success badge-pill my-auto mx-2">
                    4
                  </div>
                  <small className="text-muted my-auto">23 min</small>
                </li>
                <li className="list">
                  <div className="profile">
                    <img src="images/faces/face3.jpg" alt="image" />
                    <span className="online" />
                  </div>
                  <div className="info">
                    <p>Daniel Russell</p>
                    <p>Available</p>
                  </div>
                  <small className="text-muted my-auto">14 min</small>
                </li>
                <li className="list">
                  <div className="profile">
                    <img src="images/faces/face4.jpg" alt="image" />
                    <span className="offline" />
                  </div>
                  <div className="info">
                    <p>James Richardson</p>
                    <p>Away</p>
                  </div>
                  <small className="text-muted my-auto">2 min</small>
                </li>
                <li className="list">
                  <div className="profile">
                    <img src="images/faces/face5.jpg" alt="image" />
                    <span className="online" />
                  </div>
                  <div className="info">
                    <p>Madeline Kennedy</p>
                    <p>Available</p>
                  </div>
                  <small className="text-muted my-auto">5 min</small>
                </li>
                <li className="list">
                  <div className="profile">
                    <img src="images/faces/face6.jpg" alt="image" />
                    <span className="online" />
                  </div>
                  <div className="info">
                    <p>Sarah Graves</p>
                    <p>Available</p>
                  </div>
                  <small className="text-muted my-auto">47 min</small>
                </li>
              </ul>
            </div>
            {/* chat tab ends */}
          </div>
        </div>
        {/* partial */}
        {/* partial:partials/_sidebar.html */}
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="icon-grid menu-icon" />
                <span className="menu-title">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                data-toggle="collapse"
                href="#ui-basic"
                aria-expanded="false"
                aria-controls="ui-basic"
              >
                <i className="icon-layout menu-icon" />
                <span className="menu-title">Aadhar</span>
                <i className="menu-arrow" />
              </a>
              <div className="collapse" id="ui-basic">
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item">
                    {" "}
                    <Link className="nav-link" to="/add-aadhar">
                      Aadhar Data
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
        {/* partial */}
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-6 grid-margin stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">Add Aadhar details</h4>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="form-group">
                        <label htmlFor="exampleInputUsername1">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("name")}
                          placeholder="Enter Name"
                        />
                        <p className="text-danger">{errors.name?.message}</p>
                      </div>
                      <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Aadhar</label>
                        <input
                          {...register("aadhar")}
                          className="form-control"
                          value={aadhar}
                          onChange={handleAadharChange}
                          placeholder="XXXX-XXXX-XXXX"
                        />
                        <p className="text-danger">{errors.aadhar?.message}</p>
                      </div>
                      <div className="form-group">
                        <label htmlFor="exampleInputConfirmPassword1">
                          Age
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          {...register("age", { valueAsNumber: true })}
                          placeholder="Enter your age"
                        />
                        <p className="text-danger">{errors.age?.message}</p>
                      </div>
                      <button type="submit" className="btn btn-primary mr-2">
                        Submit
                      </button>
                      {/* <button type="reset" className="btn btn-warning">
                        Reset
                      </button> */}
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 grid-margin stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">Aadhar Data</h4>

                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>S/No</th>
                            <th>Name</th>
                            <th>Aadhar</th>
                            <th>Age</th>
                            <th>Created At</th>
                          </tr>
                        </thead>
                        <tbody>{aadharList}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* content-wrapper ends */}
          {/* partial:../../partials/_footer.html */}
          <footer className="footer">
            <div className="d-sm-flex justify-content-center justify-content-sm-between">
              <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
                Copyright © 2021. Premium{" "}
                <a href="https://www.bootstrapdash.com/" target="_blank">
                  Bootstrap admin template
                </a>{" "}
                from BootstrapDash. All rights reserved.
              </span>
            </div>
          </footer>
          {/* partial */}
        </div>

        {/* main-panel ends */}
      </div>
      {/* page-body-wrapper ends */}
    </div>
  );
};

export default AddAadhar;
