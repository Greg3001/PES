package models;

import javax.persistence.Entity;
import play.db.jpa.Model;

import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Contaminante extends Model {
    public String nombre;
    public String unidad;

    @OneToMany(mappedBy = "contaminante")
    public List<Medicion> mediciones = new ArrayList<>();

    public Contaminante(String nombre, String unidad) {
        this.nombre = nombre;
        this.unidad = unidad;
    }

    public Contaminante() {
        this.nombre = "";
        this.unidad = "";
    }
}
