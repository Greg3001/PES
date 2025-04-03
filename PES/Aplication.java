import java.util.*;

public class Application {
    private List<User> users = new ArrayList<>();
    private List<Product> products = Arrays.asList(new Product("Laptop"), new Product("Smartphone"));
    private List<Purchase> purchases = new ArrayList<>();

    // 1. Inicialización de la base de datos
    public Application() {
        users.add(new User("admin", "admin", 25)); // Usuario de prueba
    }

    // 2. Función de Login
    public boolean login(String username, String password) {
        return users.stream().anyMatch(u -> u.username.equals(username) && u.password.equals(password));
    }

    // 2. Función de Registro
    public boolean register(String username, String password, int age) {
        if (users.stream().anyMatch(u -> u.username.equals(username))) return false;
        users.add(new User(username, password, age));
        return true;
    }

    // 2. Consulta compleja: Productos comprados por menores de 18
    public List<Product> getProductsBoughtByMinors() {
        List<Product> result = new ArrayList<>();
        for (Purchase p : purchases) if (p.user.age < 18) result.add(p.product);
        return result;
    }

    public static void main(String[] args) {
        Application app = new Application();
        app.register("user1", "pass1", 17);
        app.register("user2", "pass2", 20);
        System.out.println("Login user1: " + app.login("user1", "pass1"));
        System.out.println("Products bought by minors: " + app.getProductsBoughtByMinors());
    }
}

class User {
    String username, password;
    int age;
    User(String u, String p, int a) { username = u; password = p; age = a; }
}

class Product {
    String name;
    Product(String n) { name = n; }
    public String toString() { return name; }
}

class Purchase {
    User user;
    Product product;
    Purchase(User u, Product p) { user = u; product = p; }
}
