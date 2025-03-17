package models;

import javax.persistence.Entity;
import play.db.jpa.Model;

import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class EmpresaNaviera extends Model {
    public String nombre;

    @OneToMany(mappedBy = "empresa")
    public List<Barco> barcos = new ArrayList<>();

    public EmpresaNaviera(String nombre) {
        this.nombre = nombre;
    }

    public EmpresaNaviera() {
        this.nombre = "";
    }
}
