import jwt from "jsonwebtoken";
export function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
        return next(); // no token, proceed as anonymous
    const token = authHeader.split(" ")[1];
    if (!token)
        return next(); // malformed header, skip auth but continue
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.creator = decoded; // attach decoded creator info
    }
    catch (err) {
        // token invalid or expired, ignore and continue
        console.warn("⚠️ Optional auth failed:", err.message);
    }
    next(); // always continue
}
//# sourceMappingURL=optionalAuth.js.map