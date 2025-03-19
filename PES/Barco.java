package models;

import javax.persistence.Entity;
import play.db.jpa.Model;

import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Barco extends Model {
    public String nombre;

    @ManyToOne
    public EmpresaNaviera empresa;

    @OneToMany(mappedBy = "barco")
    public List<Ubicacion> ubicaciones = new ArrayList<>();

    public Barco(String nombre, EmpresaNaviera empresa, Puerto puerto) {
        this.nombre = nombre;
        this.empresa = empresa;
        this.puerto = puerto;
    }

    public Barco() {
        this.nombre = "";
    }
}
