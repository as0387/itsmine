import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "./index.css";
import { API_URL } from "../config/constants";
import dayjs from "dayjs";
import { Button, message, InputNumber, Form, Spin, Space } from "antd";
import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";
import BidPage from "../auction/normal/bidPage";
import Commnets from "../comments/index";

import { render } from "@testing-library/react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function ProductPage() {
  const config = {
    headers: { Authorization: localStorage.getItem("Authorization") },
  };
  const { id } = useParams();
  const [userId, setuserId] = useState();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const history = useHistory();

  const getProduct = () => {
    axios
      .get(`${API_URL}/products/${id}`, config)
      .then((result) => {
        setProduct(result.data);
        console.log(result.data);
      })
      .catch((error) => {
        console.error("에러!", error);
      });
  };

  const deletePost = (postId) => {
    axios
      .delete(`${API_URL}/post/${id}`, config)
      .then((result) => {
        alert("삭제완료");
        history.push("/");
      })
      .catch((error) => {
        console.error(error);
        message.error(`에러가 발생했습니다. ${error.message}`);
      });
  };

  useEffect(
    function () {
      let jwtTokenTemp = localStorage.getItem("Authorization");

      if (jwtTokenTemp === null) {
        message.error("로그인 후 이용가능합니다!");
        history.push("/login");
      } else {
        let jwtToken = jwtTokenTemp.replace("Bearer ", "");
        getProduct();
        setuserId(jwt_decode(jwtToken).id);
      }

      axios
        .get(`${API_URL}/user-info`, config)
        .then((result) => {
          //실제 데이터로 변경
          setUser(result.data);
        })
        .catch((error) => {
          console.error("에러발생!!", error);
        });
    },
    [id, product]
  );

  if (product === null || user === null) {
    return (
      <div id="spin-spin">
        <Space size="middle">
          <Spin size="small" />
          <Spin />
          <Spin size="large" />
        </Space>
      </div>
    );
  }

  const comments = product.replys.map((reply) => {
    return {
      author: reply.user.nickname,
      avatar:
        reply.user.profileImageUrl === "/upload/public/avatar.png"
          ? `${API_URL}/upload/public/avatar.png`
          : reply.user.profileImageUrl,
      content: (
        <p>
          {reply.content}
          {userId === reply.user.id ? (
            <Button onClick={() => deleteComment(reply.id)}>삭제</Button>
          ) : (
            ""
          )}
        </p>
      ),
      datetime: dayjs(reply.createDate).fromNow(),
    };
  });

  comments.reverse();

  const deleteComment = (id2) => {
    axios
      .delete(`${API_URL}/product/${id}/reply/${id2}`, config)
      .then((result) => {
        message.info("삭제완료.");
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        message.error(`에러가 발생했습니다. ${error.message}`);
      });
  };

  const onClickPurchase = () => {
    axios
      .post(
        `${API_URL}/chat/newChat`,
        { userId1: userId, userId2: product.user.id },
        config
      )
      .then((result) => {
        console.log(result.data);
        history.replace(`/chatpage/${result.data}`);
      })
      .catch((error) => {
        console.error(error);
        message.error(`에러가 발생했습니다. ${error.message}`);
      });
  };

  return (
    <div>
      <Carousel id="carousel" fade>
        {product.photos.map((photo) => {
          return (
            <Carousel.Item>
              <img
                height="500px"
                className="d-block w-100"
                src={API_URL + photo.imageUrl}
                alt="First slide"
              />
            </Carousel.Item>
          );
        })}
      </Carousel>

      <div id="profile-box">
        <div>
          <img src={process.env.PUBLIC_URL + "/images/icons/avatar.png"} />
          <span>{product.user.nickname}</span>
        </div>
        {product.user.id === userId ? (
          <div id="change-button">
            <Link to={"/updateForm/" + product.id}>
              <Button id="change-button1" size="middle" type="primary">
                수정
              </Button>
            </Link>

            <Button
              size="middle"
              type="primary"
              danger
              onClick={() => deletePost(product.id)}
            >
              삭제
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>

      <div id="contents-box">
        <div>
          <div id="name">{product.title}</div>
          {product.type !== 1 ? (
            <div id="price">{product.price}원</div>
          ) : (
            <div id="price">{product.bid}원</div>
          )}
          <div id="createdAt">
            {dayjs(product.createdAt).format("YYYY년 MM월 DD일")}
          </div>
          {product.type === 1 ? (
            <div>
              <div>
                <div id="auction-commit">
                  <BidPage product={product} userId={userId} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div>
                <Button
                  id="purchase-button"
                  size="large"
                  type="primary"
                  danger
                  onClick={onClickPurchase}
                  disabled={product.soldout === 1 ? true : false}
                >
                  재빨리 구매하기
                </Button>
              </div>
            </div>
          )}
          <br />
          <br />
          <div id="price">상품 설명</div>
          <pre id="description">{product.description}</pre>
        </div>
      </div>

      {/* <div>
        <h1>추천 상품</h1>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {products.map((product, index) => {
            //return <ProductCard key={index} product={product} />;
          })}
        </div>
      </div> */}
      <Commnets
        product={product}
        id={id}
        user={user}
        comments={comments}
        deleteComment={deleteComment}
      />
    </div>
  );
}

export default ProductPage;
