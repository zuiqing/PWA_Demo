from http.server import BaseHTTPRequestHandler, HTTPServer

class MockCloudHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_POST(self):
        print("\n========== 收到报警推送 ==========")
        print("请求路径：", self.path)
        print("请求头：")
        for k,v in self.headers.items():
            print(f"{k}: {v}")
        content_len = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_len).decode('utf-8')
        print("推送报文：\n", body)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"code":0,"msg":"success"}')

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 9999), MockCloudHandler)
    print("✅ 模拟第三方云已启动，监听 9999 端口")
    server.serve_forever()
