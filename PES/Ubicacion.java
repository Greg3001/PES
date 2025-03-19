package models;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import play.db.jpa.Model;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Ubicacion extends Model {
    public double latitud;
    public double longitud;
    public String descripcion;

    @ManyToOne
    public Barco barco;

    @ManyToOne
    public Puerto puerto;

    public Ubicacion(double latitud, double longitud, String descripcion, Barco barco, Puerto puerto) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.descripcion = descripcion;
        this.barco = barco;
        this.puerto = puerto;
    }

    public Ubicacion() {
        this.latitud = 0.0;
        this.longitud = 0.0;
        this.descripcion = "";
    }
}