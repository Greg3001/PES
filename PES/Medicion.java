package models;

import javax.persistence.Entity;
import play.db.jpa.Model;

import javax.persistence.ManyToOne;
import java.util.Date;

@Entity
public class Medicion extends Model {
    public Date fecha;
    public double valor;

    @ManyToOne
    public Barco barco;

    @ManyToOne
    public Contaminante contaminante;

    public Medicion(Date fecha, double valor, Barco barco, Contaminante contaminante) {
        this.fecha = fecha;
        this.valor = valor;
        this.barco = barco;
        this.contaminante = contaminante;
    }

    public Medicion() {
        this.fecha = new Date();
        this.valor = 0.0;
    }
}
