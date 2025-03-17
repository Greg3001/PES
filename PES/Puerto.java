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
    public List<Barco> barcos = new ArrayList<>();
    
    public Puerto(String nombre) {
        this.nombre = nombre;
    }

    public Puerto() {
        this.nombre = "";
    }
}
