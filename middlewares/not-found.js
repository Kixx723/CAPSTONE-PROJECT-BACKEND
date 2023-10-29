
const notFoundMiddleware = (req, res) => {
    res.status(500).json({ msg: "Server Error Please Try Again Later", success: false });
};

module.exports = notFoundMiddleware;
