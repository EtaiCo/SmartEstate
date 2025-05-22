import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import ReviewForm from "./ReviewForm";

const ReviewModal = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="text-center my-4">
        <Button
          variant="warning"
          className="rounded-pill px-4"
          onClick={() => setShow(true)}
        >
          השאר משוב
        </Button>
      </div>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        size="lg"
        backdrop="static"
      >
       <Modal.Header
  closeButton
  className="bg-warning text-white"
  style={{
    borderBottom: "none",
    direction: "rtl",
    justifyContent: "center", // ✅ center heading
    textAlign: "center",
  }}
>
  <Modal.Title className="fw-bold w-100 text-center">השאר משוב</Modal.Title>
</Modal.Header>
        <Modal.Body>
          <ReviewForm closeModal={() => setShow(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ReviewModal;
