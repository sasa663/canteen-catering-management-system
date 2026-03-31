package com.canteen.controller; // 包名必须和文件夹完全对应！

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController // 必须加！标记为接口控制器
@RequestMapping("/api") // 接口统一前缀 /api
public class LoginController {

    // 先加一个 GET 测试接口，浏览器直接能访问，验证 Controller 是否被扫描到
    @GetMapping("/test")
    public String test() {
        return "后端接口正常！";
    }

    // 登录接口：POST /api/login
    @PostMapping("/login")
    public String login(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String role
    ) {
        // 测试账号：admin / 123456 / admin（管理员）
        if ("admin".equals(username) && "123456".equals(password) && "admin".equals(role)) {
            return "登录成功";
        }
        return "账号/密码/角色错误";
    }
}