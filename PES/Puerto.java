package models;

import javax.persistence.Entity;
import play.db.jpa.Model;

import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Puerto extends Model {
    public String nombre;
    
    @OneToMany(mappedBy = "puerto")
    public List<Ubicacion> ubicaciones = new ArrayList<>();

    @OneToMany(mappedBy = "puerto")  
    public List<Medicion> mediciones = new ArrayList<>();
    
    public Puerto(String nombre) {
        this.nombre = nombre;
    }

    public Puerto() {
        this.nombre = "";
    }
}
