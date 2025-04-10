import java.util.*;

class User {
    String username, password;
    int age;
    
    User(String u, String p, int a) {
        username = u;
        password = p;
        age = a;
    }
}

class Product {
    String name;
    
    Product(String n) {
        name = n;
    }
}

class consulta {
    private List<User> users = new ArrayList<>();
    private List<Product> products = new ArrayList<>();

    public consulta() {
        users.add(new User("admin", "admin", 25));
        products.add(new Product("Laptop"));
        products.add(new Product("Smartphone"));
    }

    public void register(String username, String password, int age) {
        for (User u : users) {
            if (u.username.equals(username)) {
                System.out.println("El usuario ya existe.");
                return;
            }
        }
        users.add(new User(username, password, age));
        System.out.println("Usuario registrado: " + username);
    }

    public boolean login(String username, String password) {
        for (User u : users) {
            if (u.username.equals(username) && u.password.equals(password)) {
                System.out.println("Inicio de sesión exitoso.");
                return true;
            }
        }
        System.out.println("Usuario o contraseña incorrectos.");
        return false;
    }
}
